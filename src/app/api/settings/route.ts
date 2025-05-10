import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET: Kullanıcı ayarlarını getir
export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    console.log("Oturum kullanıcı id", session?.user.id);
    if (!session) {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
    }

    const userSettings = await prisma.userSettings.findUnique({
      where: {
        userId: session.user.id,
      },
    });

    if (!userSettings) {
      return NextResponse.json(
        { error: "Ayarlar bulunamadı" },
        { status: 404 }
      );
    }

    return NextResponse.json(userSettings);
  } catch (error) {
    console.error("Ayarlar alınırken bir hata oluştu:", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}

// PATCH: Kullanıcı ayarlarını güncelle
export async function PATCH(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    });
    console.log("session", session);
    // Oturum yoksa veya kullanıcı kimliği eşleşmiyorsa erişimi reddet
    if (!session) {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
    }

    const data = await req.json();

    // Güncellenebilir alanlar
    const allowedFields = [
      "wallpaperPath",
      "language",
      "timeFormat",
      "iconPack",
      "windowAnimation",
    ];

    // İzin verilmeyen alanları filtrele
    const filteredData = Object.keys(data).reduce(
      (acc, key) => {
        if (allowedFields.includes(key)) {
          acc[key] = data[key];
        }
        return acc;
      },
      {} as Record<string, any>
    );

    // Veri yoksa güncelleme yapma
    if (Object.keys(filteredData).length === 0) {
      return NextResponse.json(
        { error: "Geçersiz güncelleme verileri" },
        { status: 400 }
      );
    }

    const updatedSettings = await prisma.userSettings.update({
      where: {
        userId: session.user.id,
      },
      data: filteredData,
    });

    return NextResponse.json(updatedSettings);
  } catch (error) {
    console.error("Ayarlar güncellenirken bir hata oluştu:", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
