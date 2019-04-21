FROM nginx:alpine
COPY default.conf /etc/nginx/conf.d/default.conf
COPY . /usr/share/nginx/html

RUN chmod -R 775 /usr/share/nginx/html
