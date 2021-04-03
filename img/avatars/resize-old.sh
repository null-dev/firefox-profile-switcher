OUTPUT_LOC="$(pwd)"
# Remove animations from cros 200 images
mkdir -p modern_cros_200
pushd modern_cros_200_original
find . -name '*.png' -exec bash -c 'mkdir -p "'"$OUTPUT_LOC"'/modern_cros_200/$(dirname "{}")"' \; -exec convert {}'[0]' -format png "$OUTPUT_LOC/modern_cros_200/{}" \;
popd

# Upscale old images
mkdir -p old_square
find old_original -name '*.png' -exec mogrify -format png -gravity center -resize 76x76 -extent 76x76 -background '#dedede' -path "$OUTPUT_LOC/old_square" {} +
mkdir -p old
pushd old_square
find . -name '*.png' -exec bash -c 'mkdir -p "'"$OUTPUT_LOC"'/old/$(dirname "{}")"' \; -exec waifu2x-converter-cpp --scale-ratio 3 -i {} -o "$OUTPUT_LOC/old/{}" \;
popd
rm -rf old_square
