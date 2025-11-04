#!/bin/bash
# Regenerate all 18 charts with the new cropping script

SCRIPT_DIR="/home/ubuntu/cyclescope-dashboard/scripts"
OUTPUT_DIR="/home/ubuntu/cyclescope-dashboard/client/public/charts"

# Array of chart URLs and names
declare -a charts=(
    "https://schrts.co/ibFUedcP|01_SPX_Secular_Trend"
    "https://schrts.co/qNPubctQ|02_Copper_Gold_Ratio"
    "https://schrts.co/UVipTWeD|03_US_Dollar_Index"
    "https://schrts.co/JwzwrkNe|04_Treasury_10Y_Yields"
    "https://schrts.co/hRQFjuGD|05_HYG_IEF_Ratio"
    "https://schrts.co/vzUPsuJK|06_JNK_IEF_Ratio"
    "https://schrts.co/GGDNXfXy|07_LQD_IEF_Ratio"
    "https://schrts.co/vKKGFDPr|08_XLY_XLP_Ratio"
    "https://schrts.co/NGenHtpa|09_IWF_IWD_Ratio"
    "https://schrts.co/wZfRYNgR|10_RSP_SPY_Ratio"
    "https://schrts.co/jFJwQSyx|11_XLK_XLP_Ratio"
    "https://schrts.co/NFhmcdEy|12_SMH_SPY_Ratio"
    "https://schrts.co/NwmJfADb|13_SPXA50R"
    "https://schrts.co/TihhqDrR|14_SPXA150R"
    "https://schrts.co/fqSwKPIQ|15_SPXA200R"
    "https://schrts.co/XdYdgKQG|16_CPCE_Put_Call"
    "https://schrts.co/feTvgpFy|17_VIX_VXV_Ratio"
    "https://schrts.co/HuFZgpqw|18_VVIX"
)

echo "Starting to regenerate all 18 charts..."
echo ""

count=0
success=0
failed=0

for chart in "${charts[@]}"; do
    IFS='|' read -r url name <<< "$chart"
    count=$((count + 1))
    
    echo "[$count/18] Processing: $name"
    echo "  URL: $url"
    
    if python3 "$SCRIPT_DIR/capture_chart.py" "$url" "$OUTPUT_DIR/${name}.png" 2>&1 | grep -q "success.*true"; then
        echo "  ✓ Success"
        success=$((success + 1))
    else
        echo "  ✗ Failed"
        failed=$((failed + 1))
    fi
    
    echo ""
    
    # Small delay between requests
    if [ $count -lt 18 ]; then
        sleep 1
    fi
done

echo "========================================="
echo "Regeneration complete!"
echo "Success: $success/18"
echo "Failed: $failed/18"
echo "========================================="

