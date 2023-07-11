.PHONY: clean
clean:
	@bash -c "set -e; if [ -d .git ]                                                ; \
		then echo 'In-git-mode'                                                       ; \
			git reset --hard HEAD                                                       ; \
			git clean -xfd .                                                            ; \
		else \
			echo 'No method to clean in non-git-mode'                                   ; \
			exit 1                                                                      ; \
		fi"

.PHONY: check-node-ver
check-node-ver:
	@bash -c 'set -e; \
						v=$$(node --version); \
						v=$${v#v}                                                             ; \
						v=$${v%%.*}                                                           ; \
						[[ $$v =~ ^[1-9][0-9]+$$ ]]                                           ; \
						if [[ ! $$v -eq 16 ]]; then \
							echo "node version 16 is stable for this make , but current is $$v" ; \
							exit 1                                                              ; \
						else \
							echo "ok: node version compatible: $$v"                             ; \
						fi'

.PHONY: build
build: check-node-ver clean
	npm install
	npm run lint
	npm run build
