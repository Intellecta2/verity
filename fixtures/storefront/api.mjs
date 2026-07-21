export function createOrder(request) {
  if (!request.user?.id) {
    return {
      status: 401,
      body: { code: 'AUTH_REQUIRED', message: 'Sign in to place an order.' }
    };
  }

  if (!Array.isArray(request.items) || request.items.length === 0) {
    return {
      status: 400,
      body: { code: 'INVALID_ORDER', message: 'Add at least one item.' }
    };
  }

  return {
    status: 201,
    body: {
      orderId: `ord_${request.user.id}_${request.items.length}`,
      state: 'accepted'
    }
  };
}
