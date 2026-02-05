#!/bin/bash
# Step 2: Run validators and connect them as peers.
# Validator count = number of Node-* dirs (from step1). Node-1 = bootnode; others use its enode.
# RPC and P2P ports from env: RPC_BASE, P2P_BASE (set by Makefile; do not hardcode).
# Run via: make start   or   RPC_BASE=... P2P_BASE=... ./validators_run.sh
# Prereq: Step 1 done (networkFiles/genesis.json, Node-1..N/data with keys).

set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

if [ -z "${RPC_BASE}" ] || [ -z "${P2P_BASE}" ]; then
  echo "Error: RPC_BASE and P2P_BASE must be set. Run via: make start"
  exit 1
fi

GENESIS="networkFiles/genesis.json"
BESU_OPTS="--rpc-http-enabled --rpc-http-api=ETH,NET,WEB3,IBFT,ADMIN --host-allowlist=* --rpc-http-cors-origins=all"

if [ ! -f "$GENESIS" ]; then
  echo "Error: $GENESIS not found. Run validators_generate.sh first."
  exit 1
fi

# Validator count from Node-* directories
VALIDATOR_COUNT=0
for d in Node-*/; do
  [ -d "$d" ] && [ -d "${d}data" ] && VALIDATOR_COUNT=$((VALIDATOR_COUNT + 1))
done
if [ "$VALIDATOR_COUNT" -lt 1 ]; then
  echo "Error: No Node-*/data directories found. Run validators_generate.sh first."
  exit 1
fi

echo "=== Step 2: Run validators and peers (count: $VALIDATOR_COUNT) ==="

# 1. Start first validator (bootnode)
echo "[1/3] Starting Node-1 (bootnode, RPC $RPC_BASE, P2P $P2P_BASE)..."
(cd Node-1 && besu --data-path=data --genesis-file=../$GENESIS --p2p-port=$P2P_BASE --rpc-http-port=$RPC_BASE $BESU_OPTS) &
sleep 5

# 2. Get bootnode enode (so others can peer)
echo "[2/3] Getting Node-1 enode..."
ENODE=""
for _ in 1 2 3 4 5; do
  ENODE=$(curl -s -X POST "http://127.0.0.1:$RPC_BASE" -H "Content-Type: application/json" \
    -d '{"jsonrpc":"2.0","method":"admin_nodeInfo","params":[],"id":1}' 2>/dev/null | jq -r '.result.enode // empty')
  [ -n "$ENODE" ] && break
  sleep 2
done
if [ -z "$ENODE" ]; then
  echo "Error: Could not get enode from Node-1 (RPC $RPC_BASE). Is Node-1 up?"
  exit 1
fi
echo "  Bootnode enode: $ENODE"

# 3. Start remaining validators (Node-2..N) with bootnodes
echo "[3/3] Starting remaining validators (peers)..."
for i in $(seq 2 "$VALIDATOR_COUNT"); do
  rpc_port=$((RPC_BASE + i - 1))
  p2p_port=$((P2P_BASE + i - 1))
  (cd "Node-$i" && besu --data-path=data --genesis-file=../$GENESIS --bootnodes="$ENODE" --p2p-port=$p2p_port --rpc-http-port=$rpc_port $BESU_OPTS) &
  echo "  Node-$i: RPC $rpc_port, P2P $p2p_port"
done
sleep 3

echo ""
echo "=== $VALIDATOR_COUNT validator(s) running (peers). ==="
for i in $(seq 1 "$VALIDATOR_COUNT"); do
  rpc_port=$((RPC_BASE + i - 1))
  p2p_port=$((P2P_BASE + i - 1))
  if [ "$i" -eq 1 ]; then
    echo "  Node-$i (bootnode): RPC $rpc_port, P2P $p2p_port"
  else
    echo "  Node-$i: RPC $rpc_port, P2P $p2p_port"
  fi
done
echo "  Check peers: curl -s -X POST http://127.0.0.1:$RPC_BASE -H 'Content-Type: application/json' -d '{\"jsonrpc\":\"2.0\",\"method\":\"net_peerCount\",\"params\":[],\"id\":1}'"
