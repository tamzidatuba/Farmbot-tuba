import DatabaseService from '../databaseservice.js';
import TokenManager from '../backend/tokenManager.js';
import express from 'express';

export default function createJobsRouter(backend) {
    const router = express.Router();

    // insert job
    router.post('/:jobType', async (req, res) => {
        const { jobType } = req.params;
        const { payload, token } = req.body
        if (!TokenManager.validateToken(token)) {
            res.status(500).json({error: "You dont have permission to do that"});
            return
        }
        try {
            let result = await DatabaseService.InsertJobToDB(jobType, payload);
            if (result === true) {
                backend.scheduleManager.checkForScheduledJobs()
                backend.appendNotification("Job '" + payload.jobname + "' saved");
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
            backend.appendNotification("Job '" + jobname + "' deleted");
            res.status(200).json({ message: 'Job deleted' });
        } catch (err) {
            res.status(500).json({ error: 'Failed to delete job' });
        }
    });

    // queue and execute a given job
    router.put("/queue/:jobname", async (req, res) => {
        const { jobname } = req.params;
        const { token } = req.body
        if (!TokenManager.validateToken(token)) {
            res.status(500).json({error: "You dont have permission to do that"});
            return
        }
        try {
            // ask DB for job
            let job = await DatabaseService.ReturnSingleJob(jobname);
            console.log(job);
            
            if (job !== null && typeof (job) !== "undefined") {
                if (await backend.scheduleManager.appendScheduledJob(job)) {
                    res.status(200).json({ message: 'Job has been queued' });
                    backend.checkForNextJob();
                } else res.status(500).json({ message: 'Job has already been queued' });
            } else res.status(500).json({ message: 'Job is not in the Database' });
        } catch(err) {
            console.error(err);
            res.status(500).json({ error: 'Failed to queue job' });
        }
    });

    // dequeue a given job
    router.put("/dequeue/:jobname", async (req, res) => {
        const { jobname } = req.params;
        const { token } = req.body
        if (!TokenManager.validateToken(token)) {
            res.status(500).json({error: "You dont have permission to do that"});
            return
        }
        if (backend.scheduleManager.removeScheduledJob(jobname)) {
            res.status(200).json({ message: 'Job has been dequeued' });
        } else res.status(500).json({ message: 'Job is not in the Queue' });
    });

    //pause job
    router.put('/pause', async (req, res) => {
        const { token } = req.body
        // check Token validation
        if (!TokenManager.validateToken(token)) {
            res.status(500).json({error: "You dont have permission to do that"});
            return
        }
        backend.pauseJob(res);
    });
    //resume job
    router.put('/resume', async (req, res) => {
        const { token } = req.body
        // check Token validation
        if (!TokenManager.validateToken(token)) {
            res.status(500).json({error: "You dont have permission to do that"});
            return
        }
        backend.continueJob(res);
    });

    router.put('/:jobtype', async (req, res) => {
        const { jobtype } = req.params;
        const { payload, token } = req.body
        if (!TokenManager.validateToken(token)) {
            res.status(500).json({error: "You dont have permission to do that"});
            return
        }
        try {
            await DatabaseService.UpdateJobToDB(jobtype, payload);
            backend.scheduleManager.checkForScheduledJobs();
            backend.appendNotification("Job '" + payload.jobname + "' modified");
            res.status(200).json({ message: 'Job updated' });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Failed to update job' });
        }
    });
    
    return router;
}