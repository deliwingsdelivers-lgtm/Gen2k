import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const demoAccounts = [
      {
        email: "server@bhairuha.local",
        password: "password",
        full_name: "Arsath Malik",
        role: "server",
      },
      {
        email: "kitchen@bhairuha.local",
        password: "password",
        full_name: "Bhairuha Kitchen",
        role: "kitchen",
      },
      {
        email: "admin@bhairuha.local",
        password: "password",
        full_name: "Bhairuha Admin",
        role: "admin",
      },
    ];

    const results = [];

    for (const account of demoAccounts) {
      try {
        // Check if user already exists
        const checkUrl = `${Deno.env.get("SUPABASE_URL")}/auth/v1/admin/users`;
        const checkResponse = await fetch(checkUrl, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
            "Content-Type": "application/json",
          },
        });

        const users = await checkResponse.json();
        const userExists = users?.users?.some((u: any) => u.email === account.email);

        if (!userExists) {
          // Create user
          const createUrl = `${Deno.env.get("SUPABASE_URL")}/auth/v1/admin/users`;
          const createResponse = await fetch(createUrl, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: account.email,
              password: account.password,
              email_confirm: true,
              user_metadata: {
                full_name: account.full_name,
              },
            }),
          });

          const newUser = await createResponse.json();

          if (newUser.user) {
            // Add to staff table
            const staffUrl = `${Deno.env.get("SUPABASE_URL")}/rest/v1/staff`;
            const staffResponse = await fetch(staffUrl, {
              method: "POST",
              headers: {
                Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                id: newUser.user.id,
                email: account.email,
                full_name: account.full_name,
                role: account.role,
                is_active: true,
              }),
            });

            if (staffResponse.ok) {
              results.push({ email: account.email, status: "created" });
            } else {
              results.push({ email: account.email, status: "user_created_staff_failed" });
            }
          } else {
            results.push({ email: account.email, status: "failed", error: newUser });
          }
        } else {
          results.push({ email: account.email, status: "already_exists" });
        }
      } catch (error) {
        results.push({
          email: account.email,
          status: "error",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    return new Response(JSON.stringify({ success: true, results }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
