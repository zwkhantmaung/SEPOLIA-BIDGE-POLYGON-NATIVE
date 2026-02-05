# ETH_Network – init (step 1), start/stop/check validators and peers.
# Usage: make -C ETH_Network init [NODE_COUNT=1]
#        make -C ETH_Network start | stop | check [RPC_BASE=8545] [PROXY_PORT=8888]
# init: step 1, request node count (default 1 if no NODE_COUNT). start/check need init first.
# start: validators + RPC proxy; RPC_BASE=first validator RPC port, PROXY_PORT=proxy port.

RPC_BASE ?= 8545
P2P_BASE ?= 30303
PROXY_PORT ?= 8888

.PHONY: init start stop check balance

# Step 1: generate validator accounts. NODE_COUNT optional; if not set, script prompts (default 1).
init:
	@./validators_generate.sh $(NODE_COUNT)

start:
	@echo "Starting validators and proxy..."
	@RPC_BASE=$(RPC_BASE) P2P_BASE=$(P2P_BASE) ./validators_run.sh > /dev/null 2>&1 &
	@sleep 5
	@if lsof -ti:$(PROXY_PORT) >/dev/null 2>&1; then echo "Proxy already on $(PROXY_PORT)."; else RPC_BASE=$(RPC_BASE) PROXY_PORT=$(PROXY_PORT) python3 proxy-start.py $(PROXY_PORT) & sleep 1; fi
	@echo "Validators and proxy running. Check with: make check"

stop:
	@lsof -ti:$(PROXY_PORT) | xargs kill 2>/dev/null || true
	@pkill -f "besu.*--data-path=data" 2>/dev/null || true
	@echo "Stopped proxy and Besu validator processes."

check:
	@n=0; for d in Node-*/; do [ -d "$$d" ] && [ -d "$$d/data" ] && n=$$((n+1)); done; \
	RPC_BASE=$(RPC_BASE); PROXY_PORT=$(PROXY_PORT); \
	addrs=(); for d in networkFiles/keys/0x*; do [ -d "$$d" ] && addrs+=("$$(basename "$$d")"); done; \
	echo "Validators (RPC $$RPC_BASE-$$((RPC_BASE+n-1)), count=$$n):"; \
	for i in $$(seq 0 $$((n-1))); do port=$$((RPC_BASE+i)); addr="$${addrs[$$i]}"; \
		hex=$$(curl -s -X POST http://127.0.0.1:$$port -H "Content-Type: application/json" -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' 2>/dev/null | jq -r '.result // empty'); \
		if [ -n "$$hex" ]; then dec=$$(printf '%d' $$hex); echo "  port $$port ($$addr): block $$dec"; else echo "  port $$port ($$addr): not running"; fi; \
	done; \
	echo "Peer count:"; \
	for i in $$(seq 0 $$((n-1))); do port=$$((RPC_BASE+i)); addr="$${addrs[$$i]}"; \
		hex=$$(curl -s -X POST http://127.0.0.1:$$port -H "Content-Type: application/json" -d '{"jsonrpc":"2.0","method":"net_peerCount","params":[],"id":1}' 2>/dev/null | jq -r '.result // empty'); \
		if [ -n "$$hex" ]; then dec=$$(printf '%d' $$hex); echo "  port $$port ($$addr): $$dec peers"; else echo "  port $$port ($$addr): N/A"; fi; \
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

# Validator balances (via RPC_BASE, latest block). Addresses from networkFiles/keys/.
balance:
	@RPC_BASE=$(RPC_BASE); \
	if [ ! -d "networkFiles/keys" ]; then echo "Error: networkFiles/keys not found. Run make init first."; exit 1; fi; \
	echo "Validator balances (via RPC $$RPC_BASE, latest block):"; \ \
	i=1; for dir in networkFiles/keys/0x*; do \
		[ -d "$$dir" ] || continue; \
		addr=$$(basename "$$dir"); \
		body=$$(jq -n -c --arg a "$$addr" '{jsonrpc:"2.0",method:"eth_getBalance",params:[$$a,"latest"],id:1}'); \
		hex=$$(curl -s -X POST "http://127.0.0.1:$$RPC_BASE" -H "Content-Type: application/json" -d "$$body" 2>/dev/null | jq -r '.result // empty'); \
		if [ -n "$$hex" ]; then eth=$$(python3 -c "print(int(\"$$hex\", 0) / 1e18)" 2>/dev/null); echo "  Node-$$i ($$addr): $$eth ETH"; else echo "  Node-$$i ($$addr): (RPC unavailable)"; fi; \
		i=$$((i+1)); \
	done
