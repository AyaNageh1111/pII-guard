PII_TESTING_TOOL		 := local-fluent-bit
PII_TESTING_TOOL_DOCKER_COMPOSE := docker compose -p ${PII_TESTING_TOOL} -f ./log-forwarder/docker-compose.yml

# Local development
test-start:	
	$(PII_TESTING_TOOL_DOCKER_COMPOSE) up -d
	cd ./log-generator && \
	npm install && \
	npm start
	cd ..
	
test-end:
	${PII_TESTING_TOOL_DOCKER_COMPOSE} down --volumes
