import cron from "node-cron";
import axios from "axios";
import { type Job, type Response } from "./types";
import { numberToArray } from "./utils";

const GETONBOARD_ENDPOINT =
  "https://www.getonbrd.com/api/v0/categories/programming/jobs";

async function getGetonboardJobs(page: number) {
  const { data } = (await axios.get(GETONBOARD_ENDPOINT, {
    params: { page, country_code: "CL" },
  })) as { data: Response };

  return data;
}

async function fetchJobsFromPages(totalPages: number) {
  const internships = await Promise.all(
    numberToArray(totalPages).map(async (page) => {
      const { data: jobs } = await getGetonboardJobs(page);
      const internshipsInCurrentPage = jobs.filter((job) => {
        // modality 4 = Internship, seniortiy 1 = no experience required
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

// Correct format to send to API
function formatOffer(offer: Job) {
  return {
    author: offer.attributes.company.data.id,
    description: `${offer.attributes.title} <br /> ${offer.attributes.description} <br /> ${offer.attributes.functions} <br /> ${offer.attributes.desirable} <br /> ${offer.attributes.benefits}`,
    source: "GetOnBoard",
  };
}

async function app() {
  console.log("[🚀] App running!");

  const response = await getGetonboardJobs(1);
  let totalPages = response.meta.total_pages; // max of 100 jobs per page, min of 1 page

  const rawInternships = (await fetchJobsFromPages(totalPages)) as Job[];
  const formattedInternships = rawInternships.map((internship) =>
    formatOffer(internship)
  );

  console.log(formattedInternships[0]);

  console.log(`[🚀] ${rawInternships?.length} possible internships were found`);
}

// runs every sunday (7) at 13:30 / 1:30pm
cron.schedule("30 13 * * 7", () => {
  app();
});
