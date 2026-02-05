#!/bin/bash
# Step 1: Generate Polygon Edge validator keys and genesis (IBFT).
# Node count from first argument or prompt. P2P_BASE from env (set by Makefile).
# Run via: make init   or   P2P_BASE=... ./validators_generate.sh [NODE_COUNT]
#
# Creates: Node-1..N/ (with secrets), networkFiles/genesis.json.

set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

if [ -z "${P2P_BASE}" ]; then
  echo "Error: P2P_BASE must be set. Run via: make init"
  exit 1
fi

# Node count: from first argument, or prompt (default 1)
if [ -n "$1" ]; then
  VALIDATOR_COUNT="$1"
else
  echo -n "Node count [1]: "
  read -r VALIDATOR_COUNT
  VALIDATOR_COUNT="${VALIDATOR_COUNT:-1}"
fi

if ! [[ "$VALIDATOR_COUNT" =~ ^[0-9]+$ ]] || [ "$VALIDATOR_COUNT" -lt 1 ]; then
  echo "Error: Node count must be a positive integer (got: $VALIDATOR_COUNT)"
  exit 1
fi

if ! command -v polygon-edge &>/dev/null; then
  echo "Error: polygon-edge not found. Install it first:"
  echo "  Binary: https://github.com/0xPolygon/polygon-edge/releases"
  echo "  Or:     go install github.com/0xPolygon/polygon-edge@latest"
  echo "  Then ensure the binary is on your PATH."
  exit 1
fi

echo "=== Step 1: Generate Polygon Edge validators and genesis (IBFT) ==="
echo "Working directory: $SCRIPT_DIR (node count: $VALIDATOR_COUNT)"

# 1. Create Node-1..N and run secrets init
echo "[1/4] Creating Node-1..$VALIDATOR_COUNT and initializing validator keys..."
for i in $(seq 1 "$VALIDATOR_COUNT"); do
  mkdir -p "Node-$i"
  polygon-edge secrets init --data-dir "Node-$i" --insecure > /dev/null 2>&1
done

# 2. Extract addresses from all nodes and Node-1 ID for bootnode
echo "[2/4] Extracting addresses from all nodes and Node-1 ID..."
PREMINE_ARGS=()
NODE1_ADDRESS=""
NODE1_ID=""

for i in $(seq 1 "$VALIDATOR_COUNT"); do
  ADDR=$(polygon-edge secrets output --data-dir "Node-$i" 2>/dev/null | awk -F'=' '/Public key/{gsub(/ /,"",$2); print $2}')
  if [ -n "$ADDR" ]; then
    PREMINE_ARGS+=("--premine" "$ADDR:1000000000000000000000000")
    if [ "$i" -eq 1 ]; then
      NODE1_ADDRESS="$ADDR"
      NODE1_OUTPUT=$(polygon-edge secrets output --data-dir Node-1 2>/dev/null)
      NODE1_ID=$(echo "$NODE1_OUTPUT" | grep -i "Node ID" | awk -F'=' '{gsub(/ /,"",$2); print $2}')
    fi
  fi
done

if [ -z "$NODE1_ADDRESS" ] || [ -z "$NODE1_ID" ]; then
  echo "Error: Could not get Node-1 address or ID. Check polygon-edge secrets output."
  exit 1
fi

# Save Node-1 ID for validators_run.sh
mkdir -p networkFiles
echo "$NODE1_ID" > networkFiles/bootnode_id
BOOTNODE="/ip4/127.0.0.1/tcp/${P2P_BASE}/p2p/${NODE1_ID}"
echo "  Node-1 address: $NODE1_ADDRESS"
echo "  Bootnode: $BOOTNODE"
echo "  Premining 1,000,000 tokens to all $VALIDATOR_COUNT validator(s)"

# 3. Generate genesis (IBFT with validators-prefix)
echo "[3/4] Generating genesis.json..."
polygon-edge genesis \
  --dir networkFiles/genesis.json \
  --consensus ibft \
  --validators-path . \
  --validators-prefix Node- \
  --chain-id 31337 \
  --block-time 2s \
  --bootnode "$BOOTNODE" \
  "${PREMINE_ARGS[@]}"

echo "[4/4] Genesis written to networkFiles/genesis.json (chain-id 31337)."

echo ""
echo "=== Step 1 done. ==="
echo "  Genesis: networkFiles/genesis.json"
echo "  Node-1..$VALIDATOR_COUNT each have secrets (validator keys)."
echo "  Start validators with: make start"
