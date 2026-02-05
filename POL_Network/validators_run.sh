#!/bin/bash
# Step 2: Run Polygon Edge validators and connect them as peers.
# Validator count = number of Node-* dirs. Node-1 = bootnode.
# RPC, P2P, GRPC ports from env: RPC_BASE, P2P_BASE, GRPC_BASE (set by Makefile).
# Run via: make start   or   RPC_BASE=... P2P_BASE=... GRPC_BASE=... ./validators_run.sh
# Prereq: validators_generate.sh done (networkFiles/genesis.json, Node-1..N/ with secrets).

set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

if [ -z "${RPC_BASE}" ] || [ -z "${P2P_BASE}" ]; then
  echo "Error: RPC_BASE and P2P_BASE must be set. Run via: make start"
  exit 1
fi
GRPC_BASE=${GRPC_BASE:-10000}

GENESIS="networkFiles/genesis.json"

if [ ! -f "$GENESIS" ]; then
  echo "Error: $GENESIS not found. Run validators_generate.sh first."
  exit 1
fi

# Validator count from Node-* directories
VALIDATOR_COUNT=0
for d in Node-*/; do
  [ -d "$d" ] && VALIDATOR_COUNT=$((VALIDATOR_COUNT + 1))
done
if [ "$VALIDATOR_COUNT" -lt 1 ]; then
  echo "Error: No Node-* directories found. Run validators_generate.sh first."
  exit 1
fi

echo "=== Step 2: Run Polygon Edge validators (count: $VALIDATOR_COUNT) ==="

# Bootnode multiaddr: Node-1 ID saved by validators_generate.sh
if [ ! -f "networkFiles/bootnode_id" ]; then
  echo "Error: networkFiles/bootnode_id not found. Run validators_generate.sh first."
  exit 1
fi
NODE1_ID=$(cat networkFiles/bootnode_id)
BOOTNODE="/ip4/127.0.0.1/tcp/${P2P_BASE}/p2p/${NODE1_ID}"

# Start each node: --data-dir Node-i --chain genesis.json --grpc :port --libp2p :port --jsonrpc :port --seal
for i in $(seq 1 "$VALIDATOR_COUNT"); do
  grpc_port=$((GRPC_BASE + i - 1))
  libp2p_port=$((P2P_BASE + i - 1))
  jsonrpc_port=$((RPC_BASE + i - 1))
  echo "  Starting Node-$i: JSON-RPC $jsonrpc_port, libp2p $libp2p_port, grpc $grpc_port"
  (cd "$SCRIPT_DIR" && polygon-edge server \
    --data-dir "Node-$i" \
    --chain "$GENESIS" \
    --grpc-address "127.0.0.1:$grpc_port" \
    --libp2p "127.0.0.1:$libp2p_port" \
    --jsonrpc "127.0.0.1:$jsonrpc_port" \
    --seal) &
done
sleep 5

echo ""
echo "=== $VALIDATOR_COUNT validator(s) running. ==="
echo "  Check: make check   or   curl -s -X POST http://127.0.0.1:$RPC_BASE -H 'Content-Type: application/json' -d '{\"jsonrpc\":\"2.0\",\"method\":\"eth_blockNumber\",\"params\":[],\"id\":1}'"
