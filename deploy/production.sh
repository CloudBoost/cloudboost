#!/bin/bash

set -e

git config --global user.email "builds@travis-ci.com"
git config --global user.name "Travis CI"
export GIT_TAG=2.0.$TRAVIS_BUILD_NUMBER
git tag $GIT_TAG -a -m "Generated tag from TravisCI for build $TRAVIS_BUILD_NUMBER"
git push -q https://$GITLOGIN@github.com/CloudBoost/cloudboost --tags


echo "$DOCKERPASSWORD" | docker login -u "$DOCKERUSERNAME" --password-stdin;
docker push cloudboost/cloudboost:2.0.$TRAVIS_BUILD_NUMBER;
docker push cloudboost/cloudboost:latest;

echo $GCLOUD_SERVICE_KEY_PRD | base64 --decode -i > ${HOME}/gcloud-service-key.json
gcloud auth activate-service-account --key-file ${HOME}/gcloud-service-key.json

gcloud --quiet config set project $PROJECT_NAME_PRD
gcloud --quiet config set container/cluster $CLUSTER_NAME_PRD
gcloud --quiet config set compute/zone ${CLOUDSDK_COMPUTE_ZONE}
gcloud --quiet container clusters get-credentials $CLUSTER_NAME_PRD

kubectl config view
kubectl config current-context

kubectl set image deployment cloudboost-api cloudboost-api=cloudboost/cloudboost:2.0.$TRAVIS_BUILD_NUMBER;
kubectl rollout status deployment cloudboost-api;

cd sdk;
npm install;
npm set init.author.name $NPM_USERNAME;
npm set init.author.email $NPM_EMAIL;
npm set init.author.url "https://cloudboost.io";
npm --no-git-tag-version version 2.0.$TRAVIS_BUILD_NUMBER --force;
echo -e "$NPM_USERNAME\n$NPM_PASSWORD\n$NPM_EMAIL" | npm login;
sleep 10s;
npm publish;