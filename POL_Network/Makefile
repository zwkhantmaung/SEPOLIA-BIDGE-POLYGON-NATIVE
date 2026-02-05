# POL_Network – init (step 1), start/stop/check validators and peers (Polygon Edge IBFT).
# Usage: make -C POL_Network init [NODE_COUNT=1]
#        make -C POL_Network start | stop | check [RPC_BASE=9545] [PROXY_PORT=9999]
# init: step 1, generate validator keys + genesis. start/check need init first.
# start: validators + RPC proxy; ports set via Make params.

RPC_BASE ?= 9545
P2P_BASE ?= 40303
GRPC_BASE ?= 10000
PROXY_PORT ?= 9999

.PHONY: init start stop check balance

# Step 1: generate Polygon Edge validator keys and genesis. NODE_COUNT optional; P2P_BASE required for bootnode.
init:
	@P2P_BASE=$(P2P_BASE) ./validators_generate.sh $(NODE_COUNT)

start:
	@echo "Starting validators and proxy..."
	@RPC_BASE=$(RPC_BASE) P2P_BASE=$(P2P_BASE) GRPC_BASE=$(GRPC_BASE) ./validators_run.sh > /dev/null 2>&1 &
	@sleep 5
	@if lsof -ti:$(PROXY_PORT) >/dev/null 2>&1; then echo "Proxy already on $(PROXY_PORT)."; else RPC_BASE=$(RPC_BASE) PROXY_PORT=$(PROXY_PORT) python3 proxy-start.py $(PROXY_PORT) & sleep 1; fi
	@echo "Validators and proxy running. Check with: make check"

stop:
	@lsof -ti:$(PROXY_PORT) | xargs kill 2>/dev/null || true
	@pkill -f "polygon-edge server" 2>/dev/null || true
	@echo "Stopped proxy and Polygon Edge validator processes."

check:
	@n=0; for d in Node-*/; do [ -d "$$d" ] && n=$$((n+1)); done; \
	RPC_BASE=$(RPC_BASE); PROXY_PORT=$(PROXY_PORT); \
	echo "Validators (RPC $$RPC_BASE-$$((RPC_BASE+n-1)), count=$$n):"; \
	for i in $$(seq 0 $$((n-1))); do port=$$((RPC_BASE+i)); \
		hex=$$(curl -s -X POST http://127.0.0.1:$$port -H "Content-Type: application/json" -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' 2>/dev/null | jq -r '.result // empty'); \
		if [ -n "$$hex" ]; then dec=$$(printf '%d' $$hex); echo "  port $$port: block $$dec"; else echo "  port $$port: not running"; fi; \
	done; \
	echo "Peer count:"; \
	for i in $$(seq 0 $$((n-1))); do port=$$((RPC_BASE+i)); \
		hex=$$(curl -s -X POST http://127.0.0.1:$$port -H "Content-Type: application/json" -d '{"jsonrpc":"2.0","method":"net_peerCount","params":[],"id":1}' 2>/dev/null | jq -r '.result // empty'); \
		if [ -n "$$hex" ]; then dec=$$(printf '%d' $$hex); echo "  port $$port: $$dec peers"; else echo "  port $$port: N/A"; fi; \
	done; \
	echo "Proxy (http://localhost:$$PROXY_PORT):"; \
	code=$$(curl -s -o /dev/null -w "%{http_code}" -X POST http://127.0.0.1:$$PROXY_PORT -H "Content-Type: application/json" -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' 2>/dev/null); \
	if [ "$$code" = "000" ]; then echo "  not running"; exit 0; fi; \
	if [ "$$code" = "502" ]; then echo "  backend unavailable"; exit 0; fi; \
	hex=$$(curl -s -X POST http://127.0.0.1:$$PROXY_PORT -H "Content-Type: application/json" -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' 2>/dev/null | jq -r '.result // empty'); \
	if [ -n "$$hex" ]; then dec=$$(printf '%d' $$hex); echo "  block: $$dec"; else echo "  block: N/A"; fi; \
	hex=$$(curl -s -X POST http://127.0.0.1:$$PROXY_PORT -H "Content-Type: application/json" -d '{"jsonrpc":"2.0","method":"net_peerCount","params":[],"id":1}' 2>/dev/null | jq -r '.result // empty'); \
	if [ -n "$$hex" ]; then dec=$$(printf '%d' $$hex); echo "  peers: $$dec"; else echo "  peers: N/A"; fi; \
	chain=$$(curl -s -X POST http://127.0.0.1:$$PROXY_PORT -H "Content-Type: application/json" -d '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}' 2>/dev/null | jq -r '.result // empty'); \
	if [ -n "$$chain" ]; then c=$$(printf '%d' $$chain); echo "  chainId: $$c"; else echo "  chainId: N/A"; fi

# Validator balances (via PROXY_PORT). Extract addresses from Node-* using polygon-edge secrets output.
balance:
	@PROXY_PORT=$(PROXY_PORT); \
	if [ ! -d "Node-1" ]; then echo "Error: Node-* directories not found. Run make init first."; exit 1; fi; \
	echo "Validator balances (via proxy http://localhost:$$PROXY_PORT, latest block):"; \
	i=1; for dir in Node-*/; do \
		[ -d "$$dir" ] || continue; \
		addr=$$(polygon-edge secrets output --data-dir "$$dir" 2>/dev/null | awk -F'=' '/Public key.*address/{gsub(/ /,"",$$2); print $$2}' | grep -oE '0x[0-9a-fA-F]{40}' | head -1); \
		if [ -z "$$addr" ]; then echo "  Node-$$i: (could not extract address)"; i=$$((i+1)); continue; fi; \
		body=$$(jq -n -c --arg a "$$addr" '{jsonrpc:"2.0",method:"eth_getBalance",params:[$$a,"latest"],id:1}'); \
		hex=$$(curl -s -X POST "http://127.0.0.1:$$PROXY_PORT" -H "Content-Type: application/json" -d "$$body" 2>/dev/null | jq -r '.result // empty'); \
		if [ -n "$$hex" ]; then eth=$$(python3 -c "print(int(\"$$hex\", 0) / 1e18)" 2>/dev/null); printf "  Node-$$i (%-42s): %s POL\n" "$$addr" "$$eth"; else echo "  Node-$$i ($$addr): (proxy unavailable)"; fi; \
		i=$$((i+1)); \
	done
