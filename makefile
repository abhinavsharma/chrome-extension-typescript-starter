setup:
	npm install
	sudo npm link lumos-history
dev:
	npm run watch
dev-all:
	cd ../lumos-history && npm run watch &
	npm run watch
build-all:
	cd ../lumos-history && npm run build
	npm run build
