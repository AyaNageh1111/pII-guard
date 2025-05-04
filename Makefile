# Local development
LOCAL_DEV_PROJECT		 := local-app-env
LOCAL_DOCKER_COMPOSE := docker-compose -p ${LOCAL_DEV_PROJECT} -f docker/dev-docker-compose.yml
LOCAL_MAIN_APP       := local-app

# All-in-one
ALL_IN_PROJECT		    := all-in-one
ALL_IN_DOCKER_COMPOSE := docker-compose -p ${ALL_IN_PROJECT} -f docker/all-in.docker-compose.yml
ALL_IN_APP            := pi-detector-all-in-app-ui

# Local development
local-up:
	$(LOCAL_DOCKER_COMPOSE) build $(LOCAL_MAIN_APP)
	$(LOCAL_DOCKER_COMPOSE) up $(LOCAL_MAIN_APP) -d
	${LOCAL_DOCKER_COMPOSE} exec -it $(LOCAL_MAIN_APP) /bin/bash
	
local-down:
	${LOCAL_DOCKER_COMPOSE} down --volumes

# All in one. for tryout
all-in-up:
	$(ALL_IN_DOCKER_COMPOSE) build $(ALL_IN_APP)  --no-cache
	$(ALL_IN_DOCKER_COMPOSE) up $(ALL_IN_APP) -d

all-in-down:
	${ALL_IN_DOCKER_COMPOSE} down --volumes

# Integration tests
# INTEGRATION_TEST_PROJECT := integration-tests
# INTEGRATION_TEST_DOCKER_COMPOSE := docker-compose -p ${INTEGRATION_TEST_PROJECT} -f integrtion-test.docker-compose.yml
# INTEGRATION_TEST_APP=integration-test-service-test

# Run Application
# EXECUTE_PROJECT := execute-service
# EXECUTE_DOCKER_COMPOSE := docker-compose -p ${EXECUTE_PROJECT} -f execute.docker-compose.yml
# EXECUTE_APP=execute-service-http

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