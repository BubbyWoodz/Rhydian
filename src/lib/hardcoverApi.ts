const HARDCOVER_API_URL = 'https://api.hardcover.app/v1/graphql';

export interface User {
  id: number;
  name: string;
  username: string;
}

export interface Book {
  id: number;
  title: string;
  subtitle?: string;
  image?: string;
  contributions?: Array<{
    author: {
      name: string;
    };
  }>;
}

export interface UserBook {
  id: number;
  status_id: number;
  progress?: number;
  book: Book;
}

export interface SearchResult {
  books: Book[];
}

/**
 * Makes a GraphQL request to the Hardcover API
 */
async function makeGraphQLRequest<T>(
  query: string,
  apiKey: string,
  variables?: Record<string, any>
): Promise<T> {
  const response = await fetch(HARDCOVER_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
      'x-hasura-role': 'user',
    },
    body: JSON.stringify({
      query,
      variables,
    }),
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText}`);
  }

  const result = await response.json();

  if (result.errors) {
    throw new Error(result.errors[0]?.message || 'GraphQL query failed');
  }

  return result.data;
}

export interface ValidationResult {
  isValid: boolean;
  errorMessage?: string;
}

/**
 * Validates an API key by attempting to fetch the current user
 * Returns validation result with error message if invalid
 */
export async function validateApiKey(apiKey: string): Promise<ValidationResult> {
  try {
    const query = `
      query ValidateToken {
        me {
          id
          name
          username
        }
      }
    `;

    const response = await fetch(HARDCOVER_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
        'x-hasura-role': 'user',
      },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      return {
        isValid: false,
        errorMessage: `Authentication failed: ${response.status} ${response.statusText}`,
      };
    }

    const result = await response.json();

    // Check for GraphQL errors
    if (result.errors && result.errors.length > 0) {
      const errorMessage = result.errors[0]?.message || 'Authentication failed';
      return {
        isValid: false,
        errorMessage,
      };
    }

    // Check if me data exists
    if (!result.data?.me) {
      return {
        isValid: false,
        errorMessage: 'Invalid API key: Unable to authenticate user',
      };
    }

    return { isValid: true };
  } catch (error) {
    console.error('API key validation error:', error);
    return {
      isValid: false,
      errorMessage: error instanceof Error ? error.message : 'Network error occurred',
    };
  }
}

/**
 * Gets the current user's profile
 */
export async function getCurrentUser(apiKey: string): Promise<User> {
  const query = `
    query {
      me {
        id
        name
        username
      }
    }
  `;

  const data = await makeGraphQLRequest<{ me: User }>(query, apiKey);
  return data.me;
}

/**
 * Gets the user's currently reading book (first one if multiple)
 * Status ID 2 = Currently Reading
 */
export async function getCurrentlyReading(apiKey: string): Promise<UserBook | null> {
  const query = `
    query {
      me {
        user_books(where: {status_id: {_eq: 2}}, limit: 1) {
          id
          status_id
          progress
          book {
            id
            title
            subtitle
            image
            contributions {
              author {
                name
              }
            }
          }
        }
      }
    }
  `;

  const data = await makeGraphQLRequest<{ me: { user_books: UserBook[] } }>(query, apiKey);
  return data.me.user_books.length > 0 ? data.me.user_books[0] : null;
}

/**
 * Gets the user's want to read list
 * Status ID 1 = Want to Read
 */
export async function getWantToRead(apiKey: string): Promise<UserBook[]> {
  const query = `
    query {
      me {
        user_books(where: {status_id: {_eq: 1}}, order_by: {created_at: desc}) {
          id
          status_id
          book {
            id
            title
            subtitle
            image
            contributions {
              author {
                name
              }
            }
          }
        }
      }
    }
  `;

  const data = await makeGraphQLRequest<{ me: { user_books: UserBook[] } }>(query, apiKey);
  return data.me.user_books;
}

/**
 * Searches for books by query string
 */
export async function searchBooks(query: string, apiKey: string): Promise<Book[]> {
  const graphqlQuery = `
    query SearchBooks($query: String!) {
      books(where: {_or: [{title: {_ilike: $query}}, {subtitle: {_ilike: $query}}]}, limit: 20) {
        id
        title
        subtitle
        image
        contributions {
          author {
            name
          }
        }
      }
    }
  `;

  const data = await makeGraphQLRequest<{ books: Book[] }>(
    graphqlQuery,
    apiKey,
    { query: `%${query}%` }
  );
  return data.books;
}

/**
 * Helper function to get author names from a book
 */
export function getBookAuthors(book: Book): string {
  if (!book.contributions || book.contributions.length === 0) {
    return 'Unknown Author';
  }

  const authors = book.contributions.map((c) => c.author.name);

  if (authors.length === 1) {
    return authors[0];
  } else if (authors.length === 2) {
    return authors.join(' and ');
  } else {
    return `${authors[0]} and ${authors.length - 1} others`;
  }
}
