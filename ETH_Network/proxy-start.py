#!/usr/bin/env python3
"""Single RPC entry point; forwards to validators with failover (RPC_BASE, RPC_BASE+1, ...).
   Backends = RPC_BASE..RPC_BASE+N-1. Env RPC_BASE and PROXY_PORT must be set (e.g. by make start).
   Besu has no built-in multiplexer; this is a custom proxy."""

import http.server
import urllib.request
import sys
import os


def _require_env(name):
    val = os.environ.get(name)
    if val is None or val == "":
        print(f"Error: {name} must be set. Run via: make start", file=sys.stderr)
        sys.exit(1)
    return int(val)


RPC_BASE = _require_env("RPC_BASE")
PROXY_PORT = _require_env("PROXY_PORT")


def get_backend_ports():
    """Discover validator count from Node-*/data and return list of RPC ports."""
    script_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(script_dir)
    n = 0
    for name in os.listdir("."):
        if name.startswith("Node-") and os.path.isdir(name):
            if os.path.isdir(os.path.join(name, "data")):
                n += 1
    if n < 1:
        return []
    return list(range(RPC_BASE, RPC_BASE + n))


BACKEND_PORTS = get_backend_ports()


class RPCProxy(http.server.BaseHTTPRequestHandler):
    def do_POST(self):
        length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(length)
        last_error = None
        for port in BACKEND_PORTS:
            try:
                req = urllib.request.Request(
                    f"http://127.0.0.1:{port}",
                    data=body,
                    method="POST",
                    headers={"Content-Type": "application/json"},
                )
                with urllib.request.urlopen(req, timeout=10) as r:
                    self.send_response(r.status)
                    for k, v in r.headers.items():
                        if k.lower() != "transfer-encoding":
                            self.send_header(k, v)
                    self.end_headers()
                    self.wfile.write(r.read())
                    return
            except Exception as e:
                last_error = e
                continue
        self.send_response(502)
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        msg = str(last_error) if last_error else "All backends down"
        self.wfile.write(
            f'{{"jsonrpc":"2.0","error":{{"message":"Proxy: {msg}"}},"id":null}}'.encode()
        )

    def log_message(self, format, *args):
        pass


def main():
    port = int(sys.argv[1]) if len(sys.argv) > 1 else PROXY_PORT
    if not BACKEND_PORTS:
        print("No Node-*/data found. Run make init and make start first.", file=sys.stderr)
        sys.exit(1)
    server = http.server.HTTPServer(("", port), RPCProxy)
    backends = ",".join(str(p) for p in BACKEND_PORTS)
    print(f"RPC proxy: http://localhost:{port} -> failover [{backends}]", flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nRPC proxy stopped.", flush=True)
        sys.exit(0)


if __name__ == "__main__":
    main()
