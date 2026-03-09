-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "plan" TEXT NOT NULL DEFAULT 'free',
    "credits_remaining" INTEGER NOT NULL DEFAULT 5,
    "stripe_customer_id" TEXT,
    "api_key" TEXT,
    "referral_code" TEXT,
    "referred_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgentRun" (
    "id" TEXT NOT NULL,
    "user_id" UUID NOT NULL,
    "agent_id" TEXT NOT NULL,
    "execution_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'queued',
    "output" TEXT,
    "error" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AgentRun_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_stripe_customer_id_key" ON "User"("stripe_customer_id");

-- CreateIndex
CREATE UNIQUE INDEX "User_api_key_key" ON "User"("api_key");

-- CreateIndex
CREATE UNIQUE INDEX "User_referral_code_key" ON "User"("referral_code");

-- CreateIndex
CREATE UNIQUE INDEX "AgentRun_execution_id_key" ON "AgentRun"("execution_id");

-- CreateIndex
CREATE INDEX "AgentRun_user_id_idx" ON "AgentRun"("user_id");

-- CreateIndex
CREATE INDEX "AgentRun_agent_id_idx" ON "AgentRun"("agent_id");

-- AddForeignKey
ALTER TABLE "AgentRun" ADD CONSTRAINT "AgentRun_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
