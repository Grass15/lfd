import swaggerAutogen from 'swagger-autogen';


const doc = {
    info: {
        version: 'v1.0.0',
        title: 'Lend A Friend',
        description: 'Lend A Friend Mobile app REST API server'
    },
    servers: [
        {
            url: 'http://localhost:8080',
            description: ''
        },
    ],
    components: {
        securitySchemes: {
            bearerAuth: {
                type: 'http',
                scheme: 'bearer',
            }
        },
        schemas: {
            User: {
                nickname: "Jhon Doe",
                $email: "johndoe@gmail.com",
            },
            Transaction: {
                $id: 125,
                $lender: {
                    $ref: '#/components/schemas/UsersModel'
                },
                $borrower: {
                    $ref: '#/components/schemas/UsersModel'
                },
            }
        }
    }
};

const outputFile = 'src/swagger_output.json';
const endpointsFiles = ['./src/routes/index.ts'];

swaggerAutogen({openapi: '3.1.0'})(outputFile, endpointsFiles, doc);