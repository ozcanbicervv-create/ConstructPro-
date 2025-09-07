import { render, screen } from '@testing-library/react';
import React from 'react';

import { Icon } from '../Icon';

describe('Icon', () => {
  it('renders children correctly', () => {
    render(
      <Icon aria-label="Test icon">
        <svg data-testid="test-svg">
          <circle cx="12" cy="12" r="10" />
        </svg>
      </Icon>
    );

    expect(screen.getByTestId('test-svg')).toBeInTheDocument();
  });

  it('applies correct size classes', () => {
    const { rerender } = render(
      <Icon size="xs" aria-label="Test icon">
        <svg />
      </Icon>
    );

    expect(screen.getByRole('img')).toHaveClass('h-3', 'w-3');

    rerender(
      <Icon size="lg" aria-label="Test icon">
        <svg />
      </Icon>
    );

    expect(screen.getByRole('img')).toHaveClass('h-6', 'w-6');

    rerender(
      <Icon size="3xl" aria-label="Test icon">
        <svg />
      </Icon>
    );

    expect(screen.getByRole('img')).toHaveClass('h-12', 'w-12');
  });

  it('applies correct color classes', () => {
    const { rerender } = render(
      <Icon color="primary" aria-label="Test icon">
        <svg />
      </Icon>
    );

    expect(screen.getByRole('img')).toHaveClass('text-blue-600');

    rerender(
      <Icon color="danger" aria-label="Test icon">
        <svg />
      </Icon>
    );

    expect(screen.getByRole('img')).toHaveClass('text-red-600');

    rerender(
      <Icon color="success" aria-label="Test icon">
        <svg />
      </Icon>
    );

    expect(screen.getByRole('img')).toHaveClass('text-green-600');
  });

  it('applies correct animation classes', () => {
    const { rerender } = render(
      <Icon animation="spin" aria-label="Test icon">
        <svg />
      </Icon>
    );

    expect(screen.getByRole('img')).toHaveClass('animate-spin');

    rerender(
      <Icon animation="wiggle" aria-label="Test icon">
        <svg />
      </Icon>
    );

    expect(screen.getByRole('img')).toHaveClass('animate-[wiggle_1s_ease-in-out_infinite]');

    rerender(
      <Icon animation="pulse" aria-label="Test icon">
        <svg />
      </Icon>
    );

    expect(screen.getByRole('img')).toHaveClass('animate-pulse');
  });

  it('handles accessibility attributes correctly', () => {
    render(
      <Icon 
        aria-label="Custom icon label"
        aria-describedby="icon-description"
        title="Icon title"
      >
        <svg />
      </Icon>
    );

    const icon = screen.getByRole('img');
    expect(icon).toHaveAttribute('aria-label', 'Custom icon label');
    expect(icon).toHaveAttribute('aria-describedby', 'icon-description');
    expect(icon).toHaveAttribute('title', 'Icon title');
  });

  it('applies custom className', () => {
    render(
      <Icon className="custom-class" aria-label="Test icon">
        <svg />
      </Icon>
    );

    expect(screen.getByRole('img')).toHaveClass('custom-class');
  });

  it('uses default variants when none specified', () => {
    render(
      <Icon aria-label="Test icon">
        <svg />
      </Icon>
    );

    const icon = screen.getByRole('img');
    expect(icon).toHaveClass('h-5', 'w-5'); // default size: md
    expect(icon).toHaveClass('text-current'); // default color: default
    expect(icon).not.toHaveClass('animate-spin'); // default animation: none
  });

  it('forwards ref correctly', () => {
    const ref = React.createRef<HTMLSpanElement>();
    render(
      <Icon ref={ref} aria-label="Test icon">
        <svg />
      </Icon>
    );

    expect(ref.current).toBeInstanceOf(HTMLSpanElement);
  });

  it('has correct default role', () => {
    render(
      <Icon aria-label="Test icon">
        <svg />
      </Icon>
    );

    expect(screen.getByRole('img')).toBeInTheDocument();
  });

  it('allows custom role override', () => {
    render(
      <Icon role="button" aria-label="Test icon">
        <svg />
      </Icon>
    );

    expect(screen.getByRole('button')).toBeInTheDocument();
  });
});