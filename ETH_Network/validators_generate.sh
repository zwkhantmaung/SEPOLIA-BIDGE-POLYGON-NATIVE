#!/bin/bash
# Step 1: Generate Ethereum Validator Accounts with Besu (init from scratch).
# Config is built in-script (no ibftConfigFile.json needed).
# Run from project root: ./ETH_Network/validators_generate.sh [NODE_COUNT]
# Or: cd ETH_Network && ./validators_generate.sh [NODE_COUNT]
# If NODE_COUNT not given: prompt "Node count [1]: "; default 1.
#
# Creates: Node-1..N/data, networkFiles/ (genesis + keys), copies keys. Genesis only in networkFiles/genesis.json.

set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

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

if ! command -v jq &>/dev/null; then
  echo "Error: jq required. Install with: brew install jq"
  exit 1
fi

# Build Besu config in-script (no external ibftConfigFile.json)
CONFIG_TMP="/tmp/ibft-config-$$.json"
trap "rm -f $CONFIG_TMP" EXIT
jq -n \
  --argjson count "$VALIDATOR_COUNT" \
  '{
    genesis: {
      config: { chainId: 1337, berlinBlock: 0, ibft2: { blockperiodseconds: 2, epochlength: 30000, requesttimeoutseconds: 4 } },
      nonce: "0x0",
      timestamp: "0x58ee40ba",
      gasLimit: "0x47b760",
      difficulty: "0x1",
      mixHash: "0x63746963616c2062797a616e74696e65206661756c7420746f6c6572616e6365",
      coinbase: "0x0000000000000000000000000000000000000000",
      alloc: {}
    },
    blockchain: { nodes: { generate: true, count: $count } }
  }' > "$CONFIG_TMP"

echo "=== Step 1: Generate Ethereum Validator Accounts (Besu IBFT) ==="
echo "Working directory: $SCRIPT_DIR (node count: $VALIDATOR_COUNT)"

# 1. Create node data directories Node-1/data .. Node-N/data
echo "[1/4] Creating Node-1..$VALIDATOR_COUNT/data directories..."
for i in $(seq 1 "$VALIDATOR_COUNT"); do
  mkdir -p "Node-$i/data"
done

# 2. Generate genesis and validator keys with Besu (config from temp file)
echo "[2/4] Running: besu operator generate-blockchain-config ..."
besu operator generate-blockchain-config \
  --config-file="$CONFIG_TMP" \
  --to=networkFiles \
  --private-key-file-name=key

# 3. Map generated keys to Node-1..N (order by ls)
echo "[3/4] Copying keys into Node-1..$VALIDATOR_COUNT/data..."
KEY_DIRS=( $(ls -1 networkFiles/keys/) )
if [ ${#KEY_DIRS[@]} -lt "$VALIDATOR_COUNT" ]; then
  echo "Error: Expected at least $VALIDATOR_COUNT key directories in networkFiles/keys/, got ${#KEY_DIRS[@]}"
  exit 1
fi
for i in $(seq 0 $((VALIDATOR_COUNT - 1))); do
  n=$((i + 1))
  addr="${KEY_DIRS[$i]}"
  cp "networkFiles/keys/$addr/key"     "Node-$n/data/"
  cp "networkFiles/keys/$addr/key.pub" "Node-$n/data/"
  echo "  Node-$n <- $addr"
done

# 4. Add 1000 ETH per validator to genesis in networkFiles
echo "[4/4] Adding 1000 ETH per validator to networkFiles/genesis.json..."
BALANCE="1000000000000000000000"
ALLOC_JSON="{}"
for dir in networkFiles/keys/0x*; do
  [ -d "$dir" ] || continue
  addr=$(basename "$dir")
  ALLOC_JSON=$(jq -n --argjson alloc "$ALLOC_JSON" --arg addr "$addr" --arg balance "$BALANCE" '$alloc + {($addr): { "balance": $balance }}')
done
GENESIS=$(jq -n --slurpfile g networkFiles/genesis.json --argjson alloc "$ALLOC_JSON" '$g[0] | .alloc = ((.alloc // {}) + $alloc)')
echo "$GENESIS" > networkFiles/genesis.json
echo "  networkFiles/genesis.json updated: 1000 ETH per validator."

echo ""
echo "=== Step 1 done. ==="
echo "  Genesis: networkFiles/genesis.json (single source of truth)."
echo "  Node-1..$VALIDATOR_COUNT/data each have key and key.pub."
echo "  Start validators with: make start or ./validators_run.sh"
