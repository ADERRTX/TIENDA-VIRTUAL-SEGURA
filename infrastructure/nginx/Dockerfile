FROM nginx:1.26-alpine AS build

COPY nginx.conf /etc/nginx/nginx.conf
COPY csp.conf /etc/nginx/conf.d/csp.conf

USER nginx