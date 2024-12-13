FROM postgres:16-alpine

ENV POSTGRES_DB=rddm_db
ENV POSTGRES_USER=rddm_user
ENV POSTGRES_PASSWORD=rddm_password

# Copy initialization scripts
COPY ./init.sql /docker-entrypoint-initdb.d/

EXPOSE 5432
