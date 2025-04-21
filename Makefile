LOCAL_DEV_PROJECT		 := local-app-env
LOCAL_DOCKER_COMPOSE := docker-compose -p ${LOCAL_DEV_PROJECT} -f docker/docker-compose.yml
LOCAL_MAIN_APP       := local-app

# Integration tests
# INTEGRATION_TEST_PROJECT := integration-tests
# INTEGRATION_TEST_DOCKER_COMPOSE := docker-compose -p ${INTEGRATION_TEST_PROJECT} -f integrtion-test.docker-compose.yml
# INTEGRATION_TEST_APP=integration-test-service-test

# Run Application
# EXECUTE_PROJECT := execute-service
# EXECUTE_DOCKER_COMPOSE := docker-compose -p ${EXECUTE_PROJECT} -f execute.docker-compose.yml
# EXECUTE_APP=execute-service-http

# Local development
local-up:
	$(LOCAL_DOCKER_COMPOSE) build $(LOCAL_MAIN_APP)
	$(LOCAL_DOCKER_COMPOSE) up $(LOCAL_MAIN_APP) -d
	${LOCAL_DOCKER_COMPOSE} exec -it $(LOCAL_MAIN_APP) /bin/bash
	
local-down:
	${LOCAL_DOCKER_COMPOSE} down --volumes


# # Integration tests
# integration-test:
# 	$(INTEGRATION_TEST_DOCKER_COMPOSE) build $(INTEGRATION_TEST_APP) --no-cache
# 	$(INTEGRATION_TEST_DOCKER_COMPOSE) up $(INTEGRATION_TEST_APP)
# 	$(INTEGRATION_TEST_DOCKER_COMPOSE) down --volumes

# # Integration tests
# execute-service:
# 	$(EXECUTE_DOCKER_COMPOSE) build $(EXECUTE_APP) --no-cache
# 	$(EXECUTE_DOCKER_COMPOSE) up $(EXECUTE_APP)
# 	$(EXECUTE_DOCKER_COMPOSE) down --volumes