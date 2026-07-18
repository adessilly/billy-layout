FROM nginx:stable-alpine
# Set working directory to nginx asset directory
WORKDIR /var/www
# Remove default nginx static assets
RUN rm -rf ./*

# Copier les sources
COPY dist/billy-layout-project/browser .
# Copier le fichier conf nginx pour tout rediriger vers index.html
COPY docker/ /etc/nginx/conf.d/

# Containers run nginx with global directives and daemon off
ENTRYPOINT ["nginx", "-g", "daemon off;"]
