FROM node:12
WORKDIR /lxcacao-server
COPY package.json /lxcacao-server
RUN yarn install
COPY . /lxcacao-server
EXPOSE 80:3000
EXPOSE 81:3001
CMD ["yarn", "start-server"]