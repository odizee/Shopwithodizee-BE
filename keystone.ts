import 'dotenv/config';
import { config,  createSchema } from '@keystone-next/keystone/schema';
import { User } from './schemas/User';
import { createAuth } from '@keystone-next/auth';
import { withItemData, statelessSessions } from '@keystone-next/keystone/session';
import { Product } from './schemas/Product';
import { ProductImage } from './schemas/ProductImage';
import { insertSeedData } from './seed-data';
import { CartItem } from './schemas/CartItem';

const databaseURL = process.env.DATABASE_URL || 'mongodb://localhost/keystone-sellwithodizee';


const sessionConfig = {
  maxAge: 60 * 60 * 24 * 360, // How long stay signed in
  secret: process.env.COOKIE_SECRET,
};

const { withAuth } = createAuth({
  listKey: 'User',
  identityField: 'email',
  secretField: 'password',
  initFirstItem: {
    fields: ['name', 'email', 'password'],

  }
})

export default withAuth(config ({
    server: {
      cors: {
        origin: [process.env.FRONTEND_URL],
        credentials: true,
      },
    },
    db: {
      adapter: 'mongoose',
      url: databaseURL,
      async onConnect(keystone) {
        console.log('connected to the database!');
        if(process.argv.includes('--seed-data'))
        await insertSeedData(keystone)
      },
    },
    lists: createSchema({
      User,
      Product,
      ProductImage,
      CartItem,
    }),
    ui: {
      
      isAccessAllowed: ({session}) => {
        console.log(session);
        return !!session?.data;
      },
    },
    session: withItemData(statelessSessions(sessionConfig), {
      User: `id`
    })
  })
)