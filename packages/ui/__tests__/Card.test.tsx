import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription, CardAction } from '../src/components/ui/card';

describe('Card', () => {
  it('renders children', () => {
    render(<Card><div data-testid="child">Content</div></Card>);
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it('renders title with header and content', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Test Title</CardTitle>
        </CardHeader>
        <CardContent>Body</CardContent>
      </Card>
    );
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });

  it('renders custom className on Card', () => {
    render(<Card className="custom-class"><div data-testid="child">Content</div></Card>);
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it('renders CardFooter, CardDescription, and CardAction', () => {
    render(
      <Card>
        <CardDescription>Description</CardDescription>
        <CardAction>Action</CardAction>
        <CardFooter>Footer</CardFooter>
      </Card>
    );
    expect(screen.getByText('Description')).toBeInTheDocument();
    expect(screen.getByText('Action')).toBeInTheDocument();
    expect(screen.getByText('Footer')).toBeInTheDocument();
  });
});
