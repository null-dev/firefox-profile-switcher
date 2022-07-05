avatarlist_path="$(realpath avatarlist.json)"
pushd ../../../public/img/avatars || exit 1
find modern_cros_100 modern_cros_200 old -type f -name '*.png' | sort | jq -R -n '[inputs]' > "$avatarlist_path"
popd || exit 1
