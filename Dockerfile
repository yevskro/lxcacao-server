FROM node:12
WORKDIR /lxcacao-server
COPY package.json /lxcacao-server
RUN yarn install
COPY . /lxcacao-server
EXPOSE 80 81
CMD ["yarn", "start-server"]