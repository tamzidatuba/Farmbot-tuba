import DatabaseService from '../databaseservice.js';
import express from 'express';

export default function createJobsRouter(backend) {
    const router = express.Router();

    // insert job
    router.post('/:jobType', async (req, res) => {
        const { jobType } = req.params;
        const object = req.body;
        try {
            let result = await DatabaseService.InsertJobToDB(jobType, object);
            if (result) {
                backend.appendNotification("Job " + object.name + " saved");
                res.status(200).json({ message: 'Job saved' });
            }
            else {
                res.status(201).json({ message: "The job name already exists." });
            }
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Failed to save job' });
        }

    });



    // get jobs of type jobType
    router.get('/:jobType', async (req, res) => {
        const { jobType } = req.params;
        try {
            let jobs;
            jobs = await DatabaseService.FetchJobsFromDB(jobType);
            res.status(200).json(jobs);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Failed to fetch jobs' });
        }
    });

    router.delete('/:jobtype/:jobname', async (req, res) => {
        const { jobtype, jobname } = req.params;
        try {
            await DatabaseService.DeleteJobFromDB(jobtype, jobname);
            //TODO remove job from scheduled Jobs
            backend.scheduleManager.removeScheduled
            backend.appendNotification("Job " + id + " deleted");
            res.status(200).json({ message: 'Job deleted' });
        } catch (err) {
            res.status(500).json({ error: 'Failed to delete job' });
        }
    });

    //pause job
    router.put('/pause', async (req, res) => {
        backend.pauseJob(res);
    });
    //resume job
    router.put('/resume', async (req, res) => {
        backend.continueJob(res);
    });

    router.put('/:jobtype', async (req, res) => {
        const { jobtype } = req.params;
        const object = req.body;
        try {
            await DatabaseService.UpdateJobToDB(jobtype, object);
            backend.appendNotification("Job " + object.name + " modified");
            res.status(200).json({ message: 'Job updated' });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Failed to update job' });
        }
    });


    //start job
    router.post('/start/:id', async (req, res) => {
        const { job_id } = req.params;
        try {
            // TODO wait for get-job method
            let job = await DatabaseService.getJob(job_id);
            backend.scheduleManager.appendJob(job);
            backend.checkForNextJob();
            res.status(200).json({ message: 'Job queued' });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Failed to queue job' });
        }
    });
    
    

    return router;
}