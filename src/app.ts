import cron from "node-cron";
import axios from "axios";
import dotenv from "dotenv";
import { type Job, type Response } from "./types";
import { numberToArray, getCurrentDate } from "./utils";

// load env file, read with process.env.NAME_OF_ENV_VARIABLE
dotenv.config();

const SECRET_PASS = process.env.SECRET_PASS;
const INTERNSHIPBOT_ENDPOINT = process.env.INTERNSHIPBOT_ENDPOINT;
const GETONBOARD_ENDPOINT =
  "https://www.getonbrd.com/api/v0/categories/programming/jobs";

// get all jobs from getonboard page
async function getGetonboardJobs(page: number) {
  const { data } = (await axios.get(GETONBOARD_ENDPOINT, {
    params: { page, country_code: "CL" },
  })) as { data: Response };

  return data;
}

// get internships and no experience required jobs from all pages
async function fetchJobsFromPages(totalPages: number) {
  const internships = await Promise.all(
    numberToArray(totalPages).map(async (page) => {
      const { data: jobs } = await getGetonboardJobs(page);
      const internshipsInCurrentPage = jobs.filter((job) => {
        // modality 4 = internship, seniortiy 1 = no experience required
        if (
          job.attributes.modality.data.id === 4 ||
          job.attributes.seniority.data.id === 1
        ) {
          console.log("[📞] +1 Job,", job.attributes.title);
          return job;
        }
      });
      return internshipsInCurrentPage;
    })
  );
  return internships.flat(Infinity);
}

// correct format to send to API
function formatOffer(offer: Job) {
  return {
    author: offer.attributes.company.data.id,
    offer: `${offer.attributes.title} <br /> ${offer.attributes.description} <br /> ${offer.attributes.functions} <br /> ${offer.attributes.desirable} <br /> ${offer.attributes.benefits}`,
    source: "GetOnBoard",
  };
}

async function app() {
  const response = await getGetonboardJobs(1);
  let totalPages = response.meta.total_pages; // max of 100 jobs per page, min of 1 page

  const rawInternships = (await fetchJobsFromPages(totalPages)) as Job[];
  const formattedInternships = rawInternships.map((internship) =>
    formatOffer(internship)
  );

  console.log(
    `[🚀] ${rawInternships?.length} possible internships or no-experience required jobs were found`
  );

  console.log("[📞] Sending offers to API...");

  // request to be send to our API
  const internshipsPromises = formattedInternships.map((jobOffer) => {
    return axios({
      method: "post",
      url: INTERNSHIPBOT_ENDPOINT,
      data: { ...jobOffer, pass: SECRET_PASS },
    });
  });

  try {
    // send all POST request at the same time
    await axios.all(internshipsPromises);

    console.log("[📞] Offers sent!");
  } catch (error) {
    console.log("[⚠️] there was an error", error);
  }
}

console.log("[🚀]: server up", getCurrentDate());

// runs every sunday (0) at 20:13 UTC
cron.schedule("13 20 * * 0", async () => {
  console.log("[🚀] Running CRON job", getCurrentDate());
  app();
});
