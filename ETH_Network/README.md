# ETH_Network – Besu IBFT private chain

Single RPC URL via proxy, validators as peers, init/run/check/balance from Make. Custom proxy (Besu has no built-in multiplexer).

## Prereqs

- **Besu** on PATH
- **jq** (for init, check, balance)
- **Python 3** (for RPC proxy)

## Quick start

```bash
# From repo root
make -C ETH_Network init          # prompt: Node count [1]; default 1
make -C ETH_Network start          # start validators and peer them
make -C ETH_Network check          # block height + peer count + wallet addresses
make -C ETH_Network balance        # validator balances (1000 ETH each if from init)
```

Or from `ETH_Network/`:

```bash
make init [NODE_COUNT=2]   # optional: NODE_COUNT=2 for 2 nodes
make start
make check
make balance
```

## Commands

| Target | Description |
|--------|-------------|
| `make init [NODE_COUNT=1]` | Step 1: generate genesis + validator keys; prompt for node count if not set (default 1). |
| `make start` | Start validators (Node-1 = bootnode, RPC from **RPC_BASE**) and proxy on **PROXY_PORT**. Override: `make start RPC_BASE=9545 PROXY_PORT=9888`. |
| `make stop` | Stop proxy (PROXY_PORT) and all Besu validator processes. |
| `make check` | Show block height and peer count per port (validators + proxy). Uses **RPC_BASE** and **PROXY_PORT**. |
| `make balance` | Show each validator's ETH balance (via RPC_BASE). |

## Ports (Make params; only defined in Makefile and here)

- **RPC_BASE** (default **8545**): first validator RPC port; others are RPC_BASE+1, RPC_BASE+2, …
- **P2P_BASE** (default **30303**): first validator P2P port; others are P2P_BASE+1, …
- **PROXY_PORT** (default **8888**): single RPC proxy port. Example: `make start RPC_BASE=9545 PROXY_PORT=9888`.

## Single RPC URL (proxy)

- **URL:** `http://localhost:8888` (or PROXY_PORT if set) — started with `make start`, stopped with `make stop`.
- **Behaviour:** Custom HTTP proxy; forwards each request to RPC_BASE, RPC_BASE+1, … until one responds. No Besu plugin; Besu has no built-in multiplexer.

Use `http://localhost:8888` in Remix, Hardhat, or scripts so you don't care which validator port is up.

## Use the chain

### Remix / Hardhat

- **RPC URL:** `http://localhost:8888` (with proxy) or `http://localhost:8545`
- **Chain ID:** 1337
- **Accounts:** validator addresses and keys live in `networkFiles/keys/` and `Node-*/data/key` (do not commit; use for testing only).

## What's next

- Use `http://localhost:8888` (started by `make start`) in Remix, Hardhat, or scripts.
- Deploy contracts: point at `http://localhost:8888` (or 8545), chain ID 1337.

## Files (do not commit generated data)

- `validators_generate.sh` – init: genesis + keys (no ibftConfigFile; config in script).
- `validators_run.sh` – run validators and peer them.
- `proxy-start.py` – custom RPC proxy (port 8888 → 8545, 8546, …).
- `networkFiles/genesis.json` – single source of truth for genesis (created by init).
- `Node-*/data/` – validator keys and chain data (created by init/run; ignore in git).
