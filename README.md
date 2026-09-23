
# Automated REActions (AREA)
### Introduction

Welcome to AREA, a state-of-the-art automation platform designed to seamlessly connect and automate a variety of digital services. Our mission is to empower users to effortlessly integrate their favorite online services, enhancing productivity and creating a highly interconnected digital experience. By automating routine tasks across platforms like Spotify, GitHub, and Discord, AREA saves time and simplifies digital workflows. AREA stands out for its user-centric approach, allowing users to create custom automations that cater to their unique needs and preferences. With AREA, the possibilities are limitless, opening a world where digital services work in harmony to support and enhance your daily life and work.

### Key Feature 
- [x] Seamless Service Integration: AREA integrates with numerous popular services such as Spotify, GitHub, and Discord, allowing for versatile and comprehensive automation capabilities
- [x] Customizable Automations: AREA allows users to create custom automations that cater to their unique needs and preferences
- [x] Intuitive User Interface: AREA’s intuitive user interface makes it easy to create and manage automations
- [x] Efficient Data Management: Utilizing PostgreSQL with Prisma ORM, AREA offers flexible and efficient data management capabilities, crucial for handling complex automation tasks.
- [x] Secure Authentication: AREA uses JWT authentication to ensure secure user authentication and authorization
- [x] Comprehensive Documentation: AREA is accompanied by detailed documentation, making it easy for developers and users to understand and leverage its full potential.

### Getting Started
These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Hardware Requirements
- [x] 1 GB RAM minimum, 2 GB RAM recommended
- [x] 25 GB of available disk space minimum,
- [x] 50 GB recommended (for development purposes)
- [x] 2 GHz or faster processor minimum

### Online Version
- [x] [AREA](https://area-epitech.herokuapp.com/)
### Prerequisites
- [x] Node.js - [Download & Install Node.js](https://nodejs.org/en/download/) and the npm package manager.
- [x] Flutter SDK - [Download & Install Flutter SDK](https://flutter.dev/docs/get-started/install)
- [x] PostgreSQL - [Download & Install PostgreSQL](https://www.postgresql.org/download/)
- [x] Docker - [Download & Install Docker](https://docs.docker.com/get-docker/)
- [x] Docker Compose - [Download & Install Docker Compose](https://docs.docker.com/compose/install/)
- [x] Prisma CLI - [Download & Install Prisma CLI](https://www.prisma.io/docs/getting-started/quickstart-typescript)
- [x] NestJS CLI - [Download & Install NestJS CLI](https://docs.nestjs.com/cli/overview)
- [x] Flutter CLI - [Download & Install Flutter CLI](https://flutter.dev/docs/get-started/install)
- [x] Next.js CLI - [Download & Install Next.js CLI](https://nextjs.org/docs/getting-started)
- [x] Git - [Download & Install Git](https://git-scm.com/downloads)
- [x] npm - [Download & Install npm](https://www.npmjs.com/get-npm)


### Installing
A step by step series of examples that tell you how to get a development env running.

- Clone the repository:
```bash
git clone
##Navigate to the Flutter app directory:
cd mobile
##Install dependencies:
flutter pub get
##Start the Flutter app:
flutter run
```

- Navigate to the Next.js app directory:
```bash
cd front
##Install dependencies:
npm install
##Start the Next.js app:
npm run dev
```

- Navigate to the NestJS backend directory:
```bash
cd back
##Install dependencies:
npm install
##launch the database:
docker-compose up -d
##Generate the Prisma client:
npx prisma generate
##Run the migrations:
npx prisma migrate dev
##Start the NestJS server:
npm run start
```
## Deploy with Docker 
- Navigate to the root directory:
```bash
##Correct the .env file:
example.env -> .env : DATABASE_URL="postgresql://area-db-user:root@area-db_area-1:5432/nest?schema=public"
##Build and launch the containers:
docker-compose up --build -d
```

## Built With
- [NestJS](https://nestjs.com/) - The web framework used
- [Next.js](https://nextjs.org/) - The web framework used
- [Flutter](https://flutter.dev/) - The mobile framework used
- [Prisma](https://www.prisma.io/) - The ORM used
- [PostgreSQL](https://www.postgresql.org/) - The database used
- [Docker](https://www.docker.com/) - The containerization tool used
- [Docker Compose](https://docs.docker.com/compose/) - The containerization tool used
- [JWT](https://jwt.io/) - The authentication method used
Contributing
Please read [CONTRIBUTING.md] for details on our code of conduct, and the process for submitting pull requests to us.

## Authors
- [**STT TEAM**]
  - 
     - [**Jean-Cyprien ROUX**]
     - [**Baptiste LEGLAUNEC**]
     - [**Titien CARELASS**]
- [**SBT TEAM**]
  - 
    - [**Sofianne BASSALER**]

## License
This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

## Acknowledgments
- [**Joeffrey RIELA**]
- [**Thomas TRICAUT**]
- [**Jordan BANKOLE**]
- [**Clery PLASSAT**]

