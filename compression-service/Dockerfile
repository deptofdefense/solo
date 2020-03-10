FROM maven:latest
COPY . .

EXPOSE 8080
WORKDIR /EXML-converter-service
#RUN ./buildJarEfficientXML.sh
RUN ./buildJarEfficientXML.sh
CMD ["java","-jar", "./target/EfficientXMLServer.jar" ]


