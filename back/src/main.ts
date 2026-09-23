import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { config } from 'dotenv';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as session from 'express-session';
import axios from 'axios';
config();
const fs = require('fs');

async function createAboutJson() {
    try {
        const servicesData = await axios.get('http://localhost:8080/serviceManager/listActionReactions');
        const aboutJson = {
            client: {
                host: process.env.IP_HOSTER
            },
            server: {
                current_time: Math.floor(Date.now() / 1000),
                services: servicesData.data.map(service => ({
                    name: service.provider,
                    actions: service.actions.map(action => ({
                        name: action.name,
                        description: "Description for " + action.name + ": " + action.description,
                    })),
                    reactions: service.reactions.map(reaction => ({
                        name: reaction.name,
                        description: "Description for " + reaction.name + ": " + reaction.description,
                    }))
                }))
            }
        };

        fs.writeFileSync('about.json', JSON.stringify(aboutJson, null, 2));
        console.log('about.json created successfully.');
    } catch (error) {
        console.error('Error creating about.json:', error);
    }
}
createAboutJson();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
  }));
    app.use(
        session({
        secret: process.env.JWT_SECRET,
        resave: false,
        saveUninitialized: false,
        }),
    );
  const config = new DocumentBuilder()
      .setTitle('AREA API')
      .setDescription('The AREA API is a REST API that allows you to manage your AREA account and services. It also allows you to manage your AREA actions and reactions.')
      .setVersion('MVP0.5')
      .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  app.enableCors(); // Enable CORS
  await app.listen(8080);
}
bootstrap();
