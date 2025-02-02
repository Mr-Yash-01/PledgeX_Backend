import { Request, Response, NextFunction } from 'express';

const checkSPEmails = (req: Request, res: Response, next: NextFunction) => {
    const { clientEmail, freelancerEmail } = req.body;

    if (clientEmail === freelancerEmail) {
        res.json({
            msg: "equal",
            message: 'Client and freelancer emails cannot be the same.',
            clientEmail,
            freelancerEmail
        });
    } else{
        next();
    }

};

export default checkSPEmails;