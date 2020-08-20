FROM node:12
WORKDIR /lxcacao-server
COPY package.json /lxcacao-server
RUN yarn install
COPY . /lxcacao-server
CMD ["yarn", "start-server"]