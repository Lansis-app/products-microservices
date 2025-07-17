import {
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
} from "@nestjs/common";
import { CreateProductDto } from "./dto/create-product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";
import { PrismaClient } from "../../generated/prisma";
import { PaginationDto } from "../common/dtos/pagination.dto";

@Injectable()
export class ProductsService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(ProductsService.name);
  async onModuleInit() {
    await this.$connect();
    this.logger.log("Connected to the database");
  }
  create(createProductDto: CreateProductDto) {
    return this.product.create({
      data: createProductDto,
    });
  }

  async findAll(paginationDto: PaginationDto) {
    const { page = 1, limit = 10 } = paginationDto;

    const totalItems = await this.product.count({
      where: { availability: true },
    });
    const totalPages = Math.ceil(totalItems / limit);

    const data = {
      data: await this.product.findMany({
        where: { availability: true },
        skip: (page - 1) * limit,
        take: limit,
      }),
      meta: {
        totalItems,
        totalPages,
        currentPage: page,
      },
    };

    return data;
  }

  async findOne(id: number) {
    const product = await this.product.findUnique({
      where: { id, availability: true },
    });
    console.log("🚀 ~ ProductsService ~ findOne ~ product:", product);

    if (!product) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }

    return { product };
  }

  async update(updateProductDto: UpdateProductDto) {
    const { id, ...data } = updateProductDto;
    await this.findOne(id);

    const productUpdated = await this.product.update({
      where: { id },
      data,
    });

    return { product: productUpdated };
  }

  async remove(id: number) {
    await this.findOne(id);

    const deletedProduct = await this.product.update({
      where: { id },
      data: { availability: false },
    });
    return { product: deletedProduct };
  }
}
