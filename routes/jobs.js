import DatabaseService from '../databaseservice.js';
import express from 'express';

export default function createJobsRouter(backend) {
    const router = express.Router();

    // insert job
    router.post('/:jobType', async (req, res) => {
        const { jobType } = req.params;
        const { object, token } = req.body
        if (!TokenManager.validateToken(token)) {
            res.status(500).json({error: "You dont have permission to do that"});
            return
        }
        try {
            let result = await DatabaseService.InsertJobToDB(jobType, object);
            if (result === true) {
                backend.appendNotification("Job " + object.jobname + " saved");
                res.status(200).json({ message: 'Job saved' });
            }
            else {
                res.status(500).json({ message: result });
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
        const { token } = req.body
        if (!TokenManager.validateToken(token)) {
            res.status(500).json({error: "You dont have permission to do that"});
            return
        }
        try {
            await DatabaseService.DeleteJobFromDB(jobtype, jobname);
            // remove job from scheduled Jobs
            backend.scheduleManager.removeScheduledJob(jobname)
            backend.appendNotification("Job " + jobname + " deleted");
            res.status(200).json({ message: 'Job deleted' });
        } catch (err) {
            res.status(500).json({ error: 'Failed to delete job' });
        }
    });

    // queue and execute a given job
    router.put("/execute/:id", async (req, res) => {
        const { jobId } = req.params;
        const { token } = req.body
        if (!TokenManager.validateToken(token)) {
            res.status(500).json({error: "You dont have permission to do that"});
            return
        }
        try {
            // ask DB for job
            let job = await DatabaseService.ReturnSingleJob(jobId);
            if (job !== null && typeof (job) !== "undefined") {
                if (backend.scheduleManager.appendScheduledJob(job)) {
                    res.status(200).json({ message: 'Job has been queued' });
                    backend.checkForNextJob();
                } else res.status(500).json({ message: 'Job has already been queued' });
            } else res.status(500).json({ message: 'Job is not in the Database' });
        } catch(e) {
            console.error(err);
            res.status(500).json({ error: 'Failed to queue job' });
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
        const { object, token } = req.body
        if (!TokenManager.validateToken(token)) {
            res.status(500).json({error: "You dont have permission to do that"});
            return
        }
        try {
            await DatabaseService.UpdateJobToDB(jobtype, object);
            backend.appendNotification("Job " + object.name + " modified");
            res.status(200).json({ message: 'Job updated' });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Failed to update job' });
        }
    });
    
    return router;
}