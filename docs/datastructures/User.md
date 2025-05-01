# User

A user in this application is either

A) A user of this site to create their own site(s).  
B) A user of a site created with this application.

## Data stored

The table that stores the user data is constructed as followed:

| Key         | Type   | Personal Data (GDPR) | Additional Information                       |
|-------------|--------|----------------------|----------------------------------------------|
| id          | UUID   | No                   |                                              |
| email       | string | No                   |                                              |
| password    | string | No                   | Hashed                                       |
| contactData | UUID   | No                   | Reference to [ContactData](./ContactData.md) |

The data structure inside the application has the following schema:

```ts
type User = {
	id: string,
  email: string,
  password: string,
  contactData: ContactData,
}
```