# POL_Network – Polygon Edge IBFT private chain

Same layout as ETH_Network: single RPC URL via proxy, validators as peers, init/start/stop/check/balance from Make. Uses **Polygon Edge** (IBFT consensus).

## Prereqs

- **polygon-edge** on PATH. Install one of:
  - **Binary:** [Releases](https://github.com/0xPolygon/polygon-edge/releases) — download `polygon-edge_*_darwin_amd64.tar.gz` (or linux), extract, and put the `polygon-edge` binary on your PATH.
  - **Go:** `go install github.com/0xPolygon/polygon-edge@latest` (then ensure `$GOPATH/bin` or `$HOME/go/bin` is on PATH).
  - **Docker:** use the image `0xpolygon/polygon-edge` for containerized runs (CLI usage differs).
- **jq** (for init, check, balance)
- **Python 3** (for RPC proxy)

## Quick start

```bash
# From repo root
make -C POL_Network init          # prompt: Node count [1]; default 1
make -C POL_Network start        # start validators and proxy
make -C POL_Network check        # block height + peer count + proxy status
make -C POL_Network balance     # validator balances (via proxy)
```

Or from `POL_Network/`:

```bash
make init [NODE_COUNT=2]
make start
make check
make balance
```

## Commands

| Target | Description |
|--------|-------------|
| `make init [NODE_COUNT=1]` | Step 1: generate Polygon Edge validator keys + genesis (IBFT). P2P_BASE set by Makefile. |
| `make start` | Start validators (Node-1 = bootnode) and proxy. Override: `make start RPC_BASE=9545 PROXY_PORT=9999`. |
| `make stop` | Stop proxy and all Polygon Edge validator processes. |
| `make check` | Show block height and peer count per port (validators + proxy). |
| `make balance` | Show balances for all validators (via proxy PROXY_PORT). |

## Ports (Make params; only defined in Makefile and here)

- **RPC_BASE** (default **9545**): first validator JSON-RPC port; others RPC_BASE+1, …
- **P2P_BASE** (default **40303**): first libp2p port; others P2P_BASE+1, … (different from ETH_Network's 30303 so both can run).
- **GRPC_BASE** (default **10000**): first gRPC port (Polygon Edge).
- **PROXY_PORT** (default **9999**): single RPC proxy port (different from ETH_Network's 8888 so both can run).

## Single RPC URL (proxy)

- **URL:** `http://localhost:9999` (or PROXY_PORT) — started with `make start`, stopped with `make stop`.
- **Behaviour:** Custom HTTP proxy; forwards each request to RPC_BASE, RPC_BASE+1, … until one responds.

Use `http://localhost:9999` in Remix, Hardhat, or scripts when using POL_Network.

## Use the chain

### Remix / Hardhat

- **RPC URL:** `http://localhost:9999` (with proxy) or `http://localhost:9545`
- **Chain ID:** 31337

## Files (do not commit generated data)

- `validators_generate.sh` – init: Polygon Edge secrets init + genesis (IBFT).
- `validators_run.sh` – run Polygon Edge validators (server) with bootnode.
- `proxy-start.py` – custom RPC proxy (PROXY_PORT → RPC_BASE, RPC_BASE+1, …).
- `networkFiles/genesis.json` – genesis (created by init).
- `networkFiles/bootnode_id` – Node-1 ID for bootnode multiaddr (created by init).
- `Node-*/` – validator data and secrets (created by init/run; ignore in git).
