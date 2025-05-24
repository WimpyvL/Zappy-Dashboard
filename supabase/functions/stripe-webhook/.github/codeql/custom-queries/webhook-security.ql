/**
 * @name Insecure Webhook Handling
 * @description Detects potential security issues in webhook request handling
 * @kind problem
 * @problem.severity warning
 * @security-severity 8.0
 * @precision high
 * @id js/insecure-webhook-handling
 * @tags security
 *       external/cwe/cwe-345
 */

import javascript
import semmle.javascript.security.WebhookHandling
import semmle.javascript.security.CryptoAlgorithms

/**
 * A webhook signature verification call
 */
class WebhookVerification extends DataFlow::CallNode {
  WebhookVerification() {
    exists(string name |
      name = ["constructEvent", "verify", "validateWebhook", "verifySignature"] |
      this.getCalleeName() = name
    )
  }
}

/**
 * A webhook request handler
 */
class WebhookHandler extends DataFlow::FunctionNode {
  WebhookHandler() {
    exists(RouteSetup setup |
      setup.getPath().getValue().matches("%webhook%") and
      this = setup.getRouteHandler()
    )
  }
}

from WebhookHandler handler, DataFlow::Node request
where
  handler.getAParameter() = request and
  not exists(WebhookVerification verification |
    verification.getAnArgument() = request.getASuccessor*()
  )
select handler,
  "Webhook handler does not verify request signature before processing"

/**
 * Find hardcoded webhook secrets
 */
from DataFlow::Node secret, string secretName
where
  secretName.matches("%WEBHOOK_SECRET%") and
  secret.asExpr() instanceof StringLiteral
select secret,
  "Webhook secret should not be hardcoded"

/**
 * Check for timing attack vulnerability in signature comparison
 */
from DataFlow::CallNode comparison
where
  comparison.getCalleeName() = ["compare", "equals", "==="] and
  exists(string arg |
    arg = comparison.getAnArgument().getStringValue() and
    arg.matches("%signature%")
  )
select comparison,
  "Potentially timing-attack vulnerable signature comparison"

/**
 * Detect missing error handling in webhook processing
 */
from TryStatement try
where
  not exists(CatchClause catch | catch = try.getCatchClause()) and
  exists(WebhookHandler handler |
    handler.getFunction().getBody().getAChild*() = try
  )
select try,
  "Webhook handler should include error handling"

/**
 * Check for proper request body parsing
 */
from DataFlow::MethodCallNode parse
where
  parse.getMethodName() = "parse" and
  exists(WebhookHandler handler |
    handler.getFunction().getBody().getAChild*() = parse.getEnclosingExpr()
  ) and
  not exists(TryStatement try |
    try.getBody().getAChild*() = parse.getEnclosingExpr()
  )
select parse,
  "Request body parsing should be wrapped in try-catch"

/**
 * Verify proper event type checking
 */
from DataFlow::PropRead eventType
where
  eventType.getPropertyName() = "type" and
  exists(WebhookHandler handler |
    handler.getFunction().getBody().getAChild*() = eventType.getEnclosingExpr()
  ) and
  not exists(IfStatement if |
    if.getCondition().getAChild*() = eventType.getEnclosingExpr()
  )
select eventType,
  "Webhook handler should validate event type"