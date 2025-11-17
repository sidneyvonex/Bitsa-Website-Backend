import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import express, { Application } from 'express';

const options ={
    definition:{
        openapi: "3.0.0",
        info:{
            title: "Bitsa Website API",
            version: "1.0.0",
            description: "API documentation for the Bitsa website backend",
            contact:{
                name:"Code with Sidney",
                url:"https://github.com/sidneyvonex",
                email:"sidneyvonex@gmail.com"
            }
        },
        components:{
            securitySchemes:{
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT"
                }
            }
        },
        security:[
            {
                bearerAuth: [] // This applies the bearerAuth security scheme globally
            }
        ],
        servers:[
            {
                url: "http://localhost:3000/api",
                description: "Development server"
            },
            {
                url: "https://api.bitsa.com/api",
                description: "Production server"
            },
            {
                url: "https://glowing-space-happiness-g45gp564vrrpcw6v5-3000.app.github.dev/api",
                description: "CodeSpace server"
            }
        ]
    },
    apis:['./Src/**/*.ts', // Path to the API docs (note: case-sensitive Src)
         './Src/Routes/**/*.ts', // Route files
         './Src/docs/swaggerSchemas.ts' // Example schemas
    ], 
}

const swaggerSpec = swaggerJSDoc(options);

export const swaggerSetup = (app:express.Application) => {
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
    
}