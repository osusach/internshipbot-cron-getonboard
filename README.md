# Internship Bot, GetOnBoard Job Offers
Query possible internships every monday

## Getting Started
To run this project locally, install the dependencies and run the local server:

```sh
npm install
npm run dev
```

To build for production:

```sh
npm run build
```

## Technologies

- **TypeScript**, using **nodemon** and **concurrently** to run the development server, and **tsup** to bundle.
- **node-cron** to schedule functions.
- **Axios** as a HTTP client to call APIs

## Contributors
- René Cáceres ([@panquequelol](https://github.com/panquequelol/)) - Setting up schedule functions to get getonboard offers.