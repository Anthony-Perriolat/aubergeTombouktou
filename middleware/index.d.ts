// import { Request } from 'express';

// interface RequestUser {
//   id: number;
//   username: string;
// }
// interface RequestUserExtended extends RequestUser {
//   auth: {
//     userId:number,
//   }
//   [key: string]: any;
// }

// declare global {
//   namespace Express {
//     interface Request {
//       // user?: RequestUser | RequestUserExtended;
//       auth?: RequestUserExtended;
//     }
//   }
// }
// export {}
// // const req: CustomRequest = req as CustomRequest;
// import { Request, Response, NextFunction } from 'express';



// export function requireAuth(req: RequestWithAuth, res: Response, next: NextFunction) {
//   const auth = req.auth!;
//   if (!auth) {
//     return res.status(401).send("Unauthorized");
//   }
//   // le reste de votre code ici
// }
declare namespace Express {
    export interface Request {
        auth: {
            userId: number
        };
    }
}