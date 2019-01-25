#!/bin/bash

set -e

echo "$DOCKERPASSWORD" | docker login -u "$DOCKERUSERNAME" --password-stdin;
echo $GCLOUD_SERVICE_KEY_PRD | base64 --decode -i > ${HOME}/gcloud-service-key.json;
gcloud auth activate-service-account --key-file ${HOME}/gcloud-service-key.json;

gcloud --quiet config set project $PROJECT_NAME_PRD;
gcloud --quiet config set container/cluster $CLUSTER_NAME_PRD;
gcloud --quiet config set compute/zone ${CLOUDSDK_COMPUTE_ZONE};
gcloud --quiet container clusters get-credentials $CLUSTER_NAME_PRD;

kubectl config view;
kubectl config current-context;

kubectl set image deployment cloudboost-api cloudboost-api=cloudboost/cloudboost:master-2.0.860;
kubectl rollout status deployment cloudboost-api;