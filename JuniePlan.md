# Add tests for all components in "src/shared".

1. Explore the structure of the "src/shared" directory to understand what needs to be tested
2. Explore each subdirectory (auth, common, persistent) to understand their contents
3. Check existing test patterns in the project to maintain consistency
4. Examine the jest.config.js to understand the test configuration
5. Look at the existing test file to understand the testing style
6. Create test files for each module in "src/shared"
7. Implement tests for each module
8. Verify tests run correctly
9. Fix all linter errors in the project
a. Check what linter is being used in the project
b. Examine the ESLint configuration file
c. Run the linter to identify errors
d. Fix the errors one by one
i. Fix @typescript-eslint/ban-ts-comment errors
- Fix in config.spec.ts
- Fix in postgres.spec.ts
ii. Fix @typescript-eslint/no-explicit-any errors
- Fix in jwt.spec.ts
- Fix in objectMapper.spec.ts
iii. Fix @typescript-eslint/no-unused-vars warnings
- Fix in jwt.spec.ts (Config)
- Fix in logger.spec.ts (Config, logger)
- Fix in postgres.spec.ts (Config)
- Fix in fileHandler.spec.ts (Config)
- Fix in objectMapper.spec.ts (mapContactDetailsToDTO, mapUserToDTO, mapSiteToDTO, PopulatedContactDetails, PopulatedUser, PopulatedSite)
iv. Run the linter again to check for remaining issues
10. Fix the ESLint error in jest.config.js
a. Check the current content of jest.config.js
b. Run ESLint on jest.config.js to identify the specific error
c. Fix the error in jest.config.js
- Try using /* eslint-env node */ comment
- Modify the ESLint configuration to include Node.js environment for jest.config.js
11. Verify all ESLint errors are fixed

# Add tests for all components in "src/shared".

1. Examine the current package.json file to understand existing scripts
2. Determine the appropriate Docker commands needed to start the local setup
3. Create a new script in package.json that uses docker-compose to start the local environment
4. Ensure the script is properly named and documented
5. Add a complementary script to stop the local environment
6. Submit the final solution