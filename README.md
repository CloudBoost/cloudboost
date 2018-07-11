### Encrypt:
- openssl enc -in config -out config.enc -e -aes256 -k your_key

### Decrypt:
- openssl enc -in config.enc -out config -d -aes256 -k your_key

