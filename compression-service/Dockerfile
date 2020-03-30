FROM maven:latest AS builder
COPY . .
EXPOSE 8080
WORKDIR /EXML-converter-service
RUN mvn -Dmaven.test.skip=true package
RUN cp -r GCSS-XSD ./target;


FROM maven:latest
RUN useradd -u 8877 app
# Change to non-root privilege
USER app
WORKDIR /app/
COPY --from=builder /EXML-converter-service/target .
CMD ["java","-jar", "./EfficientXMLServer.jar" ]