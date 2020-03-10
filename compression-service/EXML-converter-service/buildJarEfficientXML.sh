#!/bin/sh
rm -rf target;
mvn test; 
mvn -Dmaven.test.skip=true package;
cp -r GCSS-XSD ./target;
