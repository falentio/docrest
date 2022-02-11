FROM denoland/deno:alpine-1.18.2 as deno

EXPOSE 8080:8080

FROM deno as builder

COPY . .
RUN deno bundle -q --no-check --import-map import_map.json server.ts server.js

FROM deno as prod

WORKDIR /app
COPY --from=builder server.js .

CMD ["run", "--allow-net", "--allow-env", "--allow-read", "server.js"]
