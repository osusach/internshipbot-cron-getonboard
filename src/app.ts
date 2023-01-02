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

async function app() {
  console.log("[🚀] App running!");

  const response = await getGetonboardJobs(1);
  let totalPages = response.meta.total_pages; // max of 100 jobs per page, min of 1 page

  const internships = (await fetchJobsFromPages(totalPages)) as Job[];

  console.log(`[🚀] ${internships.length} possible internships were found`);
}

app();
